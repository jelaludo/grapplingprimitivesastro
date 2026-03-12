(function () {
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return;
  }

  const btn = document.createElement("button");
  btn.innerHTML = "\u7BA1 <span style='font-size:9px;letter-spacing:0.12em;opacity:0.7;margin-left:4px'>EDIT</span>";
  btn.id = "kanri-toggle";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    zIndex: "9999",
    background: "rgba(5,5,9,0.95)",
    border: "1px solid #00d4ff55",
    font: "16px monospace",
    color: "#00d4ff",
    cursor: "pointer",
    borderRadius: "4px",
    padding: "8px 14px",
    boxShadow: "0 0 12px rgba(0,212,255,0.15)",
    transition: "all 0.2s",
  });
  document.body.appendChild(btn);

  function setActive(active) {
    if (active) {
      btn.style.borderColor = "#00d4ff";
      btn.style.color = "#00d4ff";
      btn.style.textShadow = "0 0 6px #00d4ff";
    } else {
      btn.style.borderColor = "#21262d";
      btn.style.color = "#6b7280";
      btn.style.textShadow = "none";
    }
  }

  function blockLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function activate() {
    document.body.classList.add("kanri-active");
    setActive(true);
    const els = document.querySelectorAll(
      "[data-kanri-field],[data-kanri-json]"
    );
    els.forEach(function (el) {
      el.contentEditable = "true";
      el.dataset.kanriOriginal = el.textContent;
      el.style.outline = "1px dashed cyan";
      el.style.backgroundColor = "rgba(0,212,255,0.05)";
      el.addEventListener("blur", onBlur);
      // Prevent parent <a> from navigating while editing
      var parentLink = el.closest("a");
      if (parentLink) {
        parentLink.addEventListener("click", blockLinkClick, true);
        parentLink.dataset.kanriBlocked = "1";
      }
    });
  }

  function deactivate() {
    document.body.classList.remove("kanri-active");
    setActive(false);
    // Restore blocked parent links
    document.querySelectorAll("[data-kanri-blocked]").forEach(function (a) {
      a.removeEventListener("click", blockLinkClick, true);
      delete a.dataset.kanriBlocked;
    });
    const els = document.querySelectorAll("[contenteditable=true]");
    els.forEach(function (el) {
      el.contentEditable = "false";
      el.style.outline = "";
      el.style.backgroundColor = "";
      delete el.dataset.kanriOriginal;
      el.removeEventListener("blur", onBlur);
    });
  }

  btn.addEventListener("click", function () {
    if (document.body.classList.contains("kanri-active")) {
      deactivate();
    } else {
      activate();
    }
  });

  function onBlur(e) {
    var el = e.target;
    var current = el.textContent.trim();
    var original = (el.dataset.kanriOriginal || "").trim();
    if (current === original) return;

    var body;
    var label;

    if (el.dataset.kanriField) {
      label = el.dataset.kanriField;
      body = {
        action: "patch-frontmatter",
        collection: el.dataset.kanriCollection,
        fileId: el.dataset.kanriFile,
        field: el.dataset.kanriField,
        value: current,
      };
    } else if (el.dataset.kanriJson) {
      label = el.dataset.kanriPath || el.dataset.kanriJson;
      body = {
        action: "patch-json",
        file: el.dataset.kanriJson,
        path: el.dataset.kanriPath,
        value: current,
      };
    } else {
      return;
    }

    fetch("/api/kanri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function () {
        el.dataset.kanriOriginal = current;
        toast("Saved: " + label, false);
      })
      .catch(function (err) {
        toast(err.message || "Save failed", true);
      });
  }

  function toast(msg, isError) {
    var el = document.createElement("div");
    el.textContent = msg;
    Object.assign(el.style, {
      position: "fixed",
      bottom: "60px",
      left: "50%",
      transform: "translateX(-50%)",
      font: "12px monospace",
      color: isError ? "#f87171" : "#4ade80",
      background: "rgba(5,5,9,0.95)",
      border: "1px solid " + (isError ? "#991b1b" : "#166534"),
      borderRadius: "4px",
      padding: "6px 14px",
      zIndex: "10000",
      pointerEvents: "none",
    });
    document.body.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 2000);
  }
})();
