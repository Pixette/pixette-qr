// Builds a pixette://connect link from the form and draws it as a QR code.
// Nothing here talks to the network: the page's Content-Security-Policy
// (connect-src 'none', form-action 'none') would block it anyway.
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var HINTS = {
    webdav: "The WebDAV address, with http:// or https://, the port and the folder, e.g. https://192.168.1.100:5006/photo.",
    synology_photos: "Your NAS address with the DSM port, e.g. https://192.168.1.100:5001.",
    immich: "Your Immich address, e.g. http://192.168.1.100:2283. Use your Immich email as the username.",
    jellyfin: "Your Jellyfin address, e.g. http://192.168.1.100:8096.",
  };
  var PLACEHOLDERS = {
    webdav: "https://192.168.1.100:5006/photo",
    synology_photos: "https://192.168.1.100:5001",
    immich: "http://192.168.1.100:2283",
    jellyfin: "http://192.168.1.100:8096",
  };

  var qrcode = new QRCode($("qrcode"), {
    text: "pixette://connect",
    width: 280,
    height: 280,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });
  var currentUrl = "pixette://connect";

  function showFields() {
    var protocol = $("protocol").value;
    document.querySelectorAll("[data-for]").forEach(function (el) {
      el.hidden = el.getAttribute("data-for").split(" ").indexOf(protocol) < 0;
    });
    if (HINTS[protocol]) {
      $("url-hint").textContent = HINTS[protocol];
      $("url").placeholder = PLACEHOLDERS[protocol];
    }
    $("user-label").textContent = protocol === "immich" ? "Email" : "Username";
  }

  function buildUrl() {
    var protocol = $("protocol").value;
    var enc = encodeURIComponent;
    var params = [];

    if (protocol !== "webdav") params.push("protocol=" + protocol);
    if (protocol === "smb") {
      var host = $("host").value.trim();
      var port = $("port").value.trim();
      var share = $("share").value.trim();
      if (host) params.push("host=" + enc(host));
      if (port && port !== "445") params.push("port=" + enc(port));
      if (share) params.push("share=" + enc(share));
    } else {
      var url = $("url").value.trim();
      if (url) params.push("url=" + enc(url));
    }

    var user = $("user").value.trim();
    if (user) params.push("user=" + enc(user));
    // Always sent: Pixette treats a missing password as an incomplete code,
    // and accounts without a password (common on Jellyfin) need "password=".
    params.push("password=" + enc($("password").value));

    return "pixette://connect?" + params.join("&");
  }

  function status() {
    var protocol = $("protocol").value;
    if (protocol === "smb" ? !$("host").value.trim() : !$("url").value.trim()) {
      return "Add the server address to finish the code.";
    }
    if (protocol !== "smb" && !/^https?:\/\//i.test($("url").value.trim())) {
      return "The server URL must start with http:// or https://, or Pixette will refuse it.";
    }
    if (!$("user").value.trim()) return "Add the username to finish the code.";
    return "Ready. In Pixette, add a source and tap the QR code button to scan it.";
  }

  function update() {
    currentUrl = buildUrl();
    qrcode.makeCode(currentUrl);
    $("url-preview").textContent = currentUrl;
    $("qr-status").textContent = status();
  }

  $("protocol").addEventListener("change", function () { showFields(); update(); });
  $("form").addEventListener("input", update);
  $("form").addEventListener("submit", function (e) { e.preventDefault(); });

  $("copy").addEventListener("click", function () {
    var btn = this;
    navigator.clipboard.writeText(currentUrl).then(function () {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy"; }, 2000);
    });
  });

  showFields();
  update();
})();
