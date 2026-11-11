# Embed a Configurable, Static Map Image into a Web Page

This capability demonstrates how to embed a generated Maps Static API URL into a
web page using standard HTML and CSS, ensuring proper display across standard
and high-resolution (high-DPI) screens.

## Prerequisites

1.  **Completed URL Construction**: Ensure you have followed the workflow to
    **Return a URL of a configurable, static map image**.
2.  **Valid API Key & Billing**: An active Google Cloud project with billing
    enabled and a valid Maps Static API key.
3.  **HTTPS Alignment**: If your website is served over HTTPS, you **must** load
    the Maps Static API image over `https://` to prevent browser mixed-content
    security warnings.

--------------------------------------------------------------------------------

## Implementation Workflow

### 1. Basic HTML Embedding

A Maps Static API image is rendered by assigning the constructed API URL
directly to the `src` attribute of an HTML `<img>` element.

```html
<!-- Standard 400x400 map of Manhattan -->
<img
  src="https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&maptype=roadmap&key=YOUR_API_KEY&signature=YOUR_SIGNATURE&solution_id=gmp_git_agentskills_v1"
  alt="Map of Manhattan, New York"
  width="400"
  height="400"
/>
```

### 2. High-Resolution (Retina / Mobile) Display Optimization

Mobile devices and modern desktop monitors often feature high pixel densities
(over 300 PPI). Embedding a standard `scale=1` image on these displays results
in either an image that is physically too small to read or a fuzzy, pixelated
image when scaled by the browser.

To ensure crisp labels and road details across both desktop and mobile devices:

1.  Request the map with `scale=2` in the URL parameters. This doubles the
    output pixel dimensions (e.g., `size=400x400&scale=2` returns an `800x800`
    pixel image) while maintaining the exact same geographic coverage area.
2.  Constrain the `<img>` element's display dimensions to the base `size` value
    (`400px` by `400px`) using HTML `width`/`height` attributes or CSS. The
    browser will downscale the 800x800 image into the 400x400 container without
    loss of quality.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>High-DPI Static Map Embed</title>
  <style>
    .static-map-container {
      width: 400px;
      height: 400px;
      border: 1px solid #ccc;
      overflow: hidden;
    }
    .static-map-image {
      /* Constrain the 800x800 (scale=2) image to 400x400 CSS pixels */
      width: 400px;
      height: 400px;
      display: block;
    }
  </style>
</head>
<body>

  <div class="static-map-container">
    <img
      class="static-map-image"
      src="https://maps.googleapis.com/maps/api/staticmap?center=Berkeley,CA&zoom=14&size=400x400&scale=2&key=YOUR_API_KEY&signature=YOUR_SIGNATURE&solution_id=gmp_git_agentskills_v1"
      alt="High resolution map of Berkeley, CA"
    />
  </div>

</body>
</html>
```

### 3. Responsive / Multi-Resolution Embedding (`srcset`)

You can also use the HTML `srcset` attribute to let the browser automatically
select between `scale=1` and `scale=2` based on the device's pixel ratio:

```html
<img
  src="https://maps.googleapis.com/maps/api/staticmap?center=51.477222,0&zoom=14&size=400x400&scale=1&key=YOUR_API_KEY&signature=YOUR_SIGNATURE&solution_id=gmp_git_agentskills_v1"
  srcset="
    https://maps.googleapis.com/maps/api/staticmap?center=51.477222,0&zoom=14&size=400x400&scale=1&key=YOUR_API_KEY&signature=YOUR_SIGNATURE&solution_id=gmp_git_agentskills_v1 1x,
    https://maps.googleapis.com/maps/api/staticmap?center=51.477222,0&zoom=14&size=400x400&scale=2&key=YOUR_API_KEY&signature=YOUR_SIGNATURE&solution_id=gmp_git_agentskills_v1 2x"
  width="400"
  height="400"
  alt="Map of Greenwich, England"
/>
```

### 4. Dynamic JavaScript Embedding

When constructing the URL dynamically in JavaScript (for example, based on user
input or application state), ensure all special characters (such as pipe `|`
separators in `markers` or `path`, and spaces in addresses) are properly
URL-encoded before assigning to `img.src`.

```javascript
function renderStaticMap(containerId, apiKey, signature) {
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";

  const params = new URLSearchParams({
    center: "Williamsburg,Brooklyn,NY",
    zoom: "13",
    size: "400x400",
    scale: "2",
    maptype: "roadmap",
    markers: "color:blue|label:S|11211|11206|11222",
    key: apiKey,
    signature: signature,
    solution_id: "gmp_git_agentskills_v1"
  });

  const img = document.createElement("img");
  img.src = `${baseUrl}?${params.toString()}`;
  img.alt = "Map of Williamsburg with markers";
  img.width = 400;
  img.height = 400;

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
    container.appendChild(img);
  }
}
```

--------------------------------------------------------------------------------

## Key Considerations & Troubleshooting

*   **Maximum Image Dimensions**: The maximum allowable `size` parameter is
    `640x640`. When combined with `scale=2`, the maximum returned image
    resolution is `1280x1280` pixels.
*   **Reduced Google Logo on Small Maps**: Maps configured with a width smaller
    than 180 pixels (`size=100x100`, etc.) will automatically display a
    reduced-size Google logo.
*   **URL Length Limit**: Ensure your final encoded `src` URL does not exceed
    **16,384 characters**, especially when embedding complex maps with numerous
    markers or encoded polylines.
*   **Image Format Selection (`format`)**:
    *   Use `png` (default `png8`), `png32`, or `gif` for lossless detail (sharp
        text labels and crisp road lines).
    *   Use `jpg` or `jpg-baseline` if minimizing file size for slower
        connections is more important than lossless visual quality.
*   **Debugging Missing Elements**: If a map renders but markers or paths are
    missing, inspect the network response in your browser's Developer Tools. The
    Maps Static API reports non-fatal configuration issues via HTTP response
    headers (`X-Staticmap-API-Warning`).
