export default function loadImageAsync(src, resolve, reject) {
    let image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
}