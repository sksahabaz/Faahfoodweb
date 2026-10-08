package com.food.model;

import java.sql.Timestamp;

public class User {

    private int userId;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String role;
    private Timestamp createdDate;
    private Timestamp lastLoginDate;

    // Default constructor
    public User() {
    }

    // Parameterized constructor
    public User(int userId, String name, String email, String password,
                String phone, String address, String role,
                Timestamp createdDate, Timestamp lastLoginDate) {

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
        this.role = role;
        this.createdDate = createdDate;
        this.lastLoginDate = lastLoginDate;
    }

    // Getters and Setters

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Timestamp getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Timestamp createdDate) {
        this.createdDate = createdDate;
    }

    public Timestamp getLastLoginDate() {
        return lastLoginDate;
    }

    public void setLastLoginDate(Timestamp lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", address='" + address + '\'' +
                ", role='" + role + '\'' +
                ", createdDate=" + createdDate +
                ", lastLoginDate=" + lastLoginDate +
                '}';
    }
}