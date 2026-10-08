const heroImages = [
    "images/hero/biryani.png",
    "images/hero/pizza.png",
    "images/hero/burger.png"
];

let currentHeroIndex = 0;

const heroImage = document.getElementById("heroFoodImage");
const heroDots = document.querySelectorAll(".dot-btn");


function showHeroImage(index) {

    if (!heroImage) {
        return;
    }

    currentHeroIndex = index;

    // Fade out
    heroImage.style.opacity = "0";

    setTimeout(() => {

        heroImage.src =
            heroImages[currentHeroIndex];

        // Fade in
        heroImage.style.opacity = "1";

    }, 250);


    // Update dots

    heroDots.forEach((dot, dotIndex) => {

        dot.classList.toggle(
            "active",
            dotIndex === currentHeroIndex
        );

    });
}


/* =========================================================
   DOT CLICK
========================================================= */

heroDots.forEach((dot) => {

    dot.addEventListener("click", () => {

        const index =
            parseInt(dot.dataset.index);

        showHeroImage(index);

    });

});


/* =========================================================
   AUTOMATIC SLIDER
========================================================= */

setInterval(() => {

    let nextIndex =
        (currentHeroIndex + 1) %
        heroImages.length;

    showHeroImage(nextIndex);

}, 2000);