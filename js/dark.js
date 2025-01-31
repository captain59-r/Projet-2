const darkModeToggle = document.getElementById("dark-mode-toggle");

const isDarkMode = localStorage.getItem("dark-mode") === "enabled";

if (isDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "Désactiver le Mode Sombre";
}

darkModeToggle.addEventListener("click", () => {
    const isCurrentlyDark = document.body.classList.toggle("dark-mode");

    if (isCurrentlyDark) {
        darkModeToggle.textContent = "Désactiver le Mode Sombre";
        localStorage.setItem("dark-mode", "enabled");
    } else {
        darkModeToggle.textContent = "Activer le Mode Sombre";
        localStorage.setItem("dark-mode", "disabled");
    }
});