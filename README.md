# Pixette QR Code Generator

Makes a QR code that sets up a server in [Pixette](https://pixette.app), the slideshow app
for NAS. Type your server and login once, then scan the code on each phone or tablet.

Live: https://qr.pixette.app

## Your password stays in your browser

You should not have to take our word for it, so here is how to check.

1. **The page cannot send data.** `index.html` starts with a Content-Security-Policy that
   your browser enforces:

   ```
   default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:;
   connect-src 'none'; form-action 'none'; base-uri 'none'
   ```

   `connect-src 'none'` blocks fetch, XHR, WebSocket and beacons. `form-action 'none'` blocks
   form posts. `img-src 'self' data:` blocks image requests to other servers. Only the two
   script files in this repository may run.

2. **Watch the network.** Open your browser's developer tools, go to the Network tab, and
   type into the form. No request appears.

3. **What runs is what is here.** GitHub Pages serves the files in this repository as they
   are, with no build step. The whole app is `index.html`, `app.js` (about 100 lines) and
   `style.css`.

4. **No third-party code from a CDN.** `qrcode.min.js` is
   [qrcodejs 1.0.0](https://github.com/davidshimjs/qrcodejs) by Shim Sangmin (MIT),
   copied unchanged from
   `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`.
   SHA-256: `c541ef06327885a8415bca8df6071e14189b4855336def4f36db54bde8484f36`
   (`shasum -a 256 qrcode.min.js`).

You can also download this repository and open `index.html` from your computer.

## Link format

```
pixette://connect?protocol=<type>&url=<server URL>&user=<user>&password=<password>
```

| Parameter | Used by | Value |
|---|---|---|
| `protocol` | all | `webdav` (default), `smb`, `synology_photos`, `immich`, `jellyfin` |
| `url` | all but SMB | Full server URL, `http://` or `https://` |
| `host` | SMB | Host name or IP address |
| `port` | SMB | Optional, default 445 |
| `share` | SMB | Share name |
| `user` | all | User name (Immich: your email) |
| `password` | all | Always present, even empty (`password=`) |

Every value is URL-encoded. Plex and OneDrive are not supported: Pixette signs in to them
on the device, so their tokens never travel in a code.

## License

MIT. See [LICENSE](LICENSE).
