package com.food.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Profile pictures, kept as files on the server (never in MySQL): one file per user,
 * named after the user id, so the picture belongs to the account without any database
 * column. Replacing a picture overwrites the file; the file's modification time is used as a
 * version in the picture URL, so browsers fetch the new one at once.
 *
 * Folder: FAAH_UPLOAD_DIR (environment) or faah.uploadDir (system property), else
 * {catalina.base}/faah-data, else ~/.faahfood; pictures go in its "avatars" subfolder.
 * On a host whose disk is reset on every deploy (e.g. Render without a persistent disk),
 * point FAAH_UPLOAD_DIR at a persistent disk, or pictures are lost on redeploy.
 */
public final class AvatarStore {

    /** Largest accepted picture (the browser shrinks photos well below this first). */
    public static final int MAX_BYTES = 5 * 1024 * 1024;

    private static final Path DIR = baseDir().resolve("avatars");

    private AvatarStore() {
    }

    private static Path baseDir() {
        String dir = System.getenv("FAAH_UPLOAD_DIR");
        if (dir == null || dir.isBlank()) {
            dir = System.getProperty("faah.uploadDir");
        }
        if (dir == null || dir.isBlank()) {
            String catalina = System.getProperty("catalina.base");
            return catalina != null
                    ? Paths.get(catalina, "faah-data")
                    : Paths.get(System.getProperty("user.home"), ".faahfood");
        }
        return Paths.get(dir);
    }

    private static Path file(int userId) {
        return DIR.resolve("user-" + userId + ".img");
    }

    /** The picture's version (modification time), or null when the user has none. */
    public static Long version(int userId) {
        Path path = file(userId);
        try {
            return Files.isRegularFile(path) ? Files.getLastModifiedTime(path).toMillis() : null;
        } catch (IOException e) {
            return null;
        }
    }

    public static byte[] read(int userId) throws IOException {
        Path path = file(userId);
        return Files.isRegularFile(path) ? Files.readAllBytes(path) : null;
    }

    /** Writes the picture (to a temporary file first, so a reader never sees half a file). */
    public static void save(int userId, byte[] image) throws IOException {
        Files.createDirectories(DIR);
        Path temp = Files.createTempFile(DIR, "upload-", ".tmp");
        try {
            Files.write(temp, image);
            Files.move(temp, file(userId), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    public static void delete(int userId) throws IOException {
        Files.deleteIfExists(file(userId));
    }

    /**
     * The image type from the file's first bytes (not from its name or the browser's claim):
     * image/jpeg, image/png or image/webp, or null for anything else.
     */
    public static String detectType(byte[] data) {
        if (data == null || data.length < 12) {
            return null;
        }
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if ((data[0] & 0xFF) == 0x89 && data[1] == 'P' && data[2] == 'N' && data[3] == 'G'
                && data[4] == 0x0D && data[5] == 0x0A && data[6] == 0x1A && data[7] == 0x0A) {
            return "image/png";
        }
        if (data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return "image/webp";
        }
        return null;
    }
}
