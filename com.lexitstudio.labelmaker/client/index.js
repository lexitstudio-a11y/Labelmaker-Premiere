(function () {
    "use strict";

    // Fixed Premiere Pro label palette order (index 0-15), matching the
    // French names shown in Edit > Preferences > Labels.
    var PALETTE = [
        { name: "Violet", hex: "#4A3FA0" },
        { name: "Iris", hex: "#3B6E93" },
        { name: "Caraibe", hex: "#5C7A3A" },
        { name: "Lavande", hex: "#8B4FA0" },
        { name: "Ceruleen", hex: "#3E7C8A" },
        { name: "Foret", hex: "#5B5C2E" },
        { name: "Rose", hex: "#A5375A" },
        { name: "Mangue", hex: "#C1662A" },
        { name: "Pourpre", hex: "#5B2FC2" },
        { name: "Bleu", hex: "#2E3E9E" },
        { name: "Bleu-vert", hex: "#2E7268" },
        { name: "Magenta", hex: "#9A3670" },
        { name: "Brun roux", hex: "#8C6A4E" },
        { name: "Vert", hex: "#4B7A3E" },
        { name: "Marron", hex: "#7C5D30" },
        { name: "Jaune", hex: "#A8952E" }
    ];

    var csInterface = new CSInterface();

    function renderPalette() {
        var container = document.getElementById("palette");
        var html = "";
        for (var i = 0; i < PALETTE.length; i++) {
            html +=
                '<div class="swatch-row">' +
                '<span class="swatch" style="background:' + PALETTE[i].hex + '"></span>' +
                "<span>" + (i + 1) + ". " + PALETTE[i].name + "</span>" +
                "</div>";
        }
        container.innerHTML = html;
    }

    function setStatus(message, kind) {
        var el = document.getElementById("status");
        el.textContent = message;
        el.className = "status" + (kind ? " " + kind : "");
    }

    function handleResult(result) {
        if (!result || result.indexOf("success:") === 0) {
            var counts = result ? result.substring("success:".length) : "";
            setStatus("Labels appliques (" + counts + ").", "ok");
            return;
        }

        var errors = {
            "error:no_sequence": "Aucune sequence active.",
            "error:no_qe_sequence": "Impossible d'acceder a la sequence (QE).",
            "error:no_selection": "Aucun element selectionne dans la timeline.",
            "error:label_unsupported": "Cette version de Premiere ne permet pas de definir la couleur de label via script."
        };

        setStatus(errors[result] || ("Erreur: " + result), "err");
    }

    function applyCroissant() {
        setStatus("Application des labels...", "");
        csInterface.evalScript("labelmaker_applyCroissant()", function (result) {
            handleResult(result);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderPalette();
        document.getElementById("croissant-btn").addEventListener("click", applyCroissant);
    });
})();
