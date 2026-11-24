/** Generate Android TV assets from Tech Home TV's shared artwork. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const icons = new URL('../../apps/web/src/assets/icons/', import.meta.url);
const resources = new URL('../android/app/src/main/res/', import.meta.url);
const iconMaster = await readFile(new URL('tech-home-tv-icon-master.png', icons));
const renderIcon = (size, crop) =>
    sharp(iconMaster)
        .extract({ left: Math.round((1024 - crop) / 2), top: Math.round((1024 - crop) / 2), width: crop, height: crop })
        .resize(size, size)
        .png()
        .toBuffer();

for (const [name, size, crop] of [
    ['icon.png', 1024, 760], ['icon-1024.png', 1024, 760],
    ['icon-512.png', 512, 760], ['icon-256.png', 256, 760],
    ['icon-tv-256.png', 256, 760], ['icon-128.png', 128, 760],
    ['icon-64.png', 64, 760], ['icon-48.png', 48, 760],
    ['icon-32.png', 32, 760], ['icon-16.png', 16, 760],
    ['android-chrome-512x512.png', 512, 760], ['android-chrome-192x192.png', 192, 760],
    ['apple-touch-icon.png', 180, 760], ['favicon.512x512.png', 512, 760],
    ['favicon.256x256.png', 256, 760], ['favicon.png', 32, 760],
    ['android-chrome-maskable-512x512.png', 512, 930],
    ['android-chrome-maskable-192x192.png', 192, 930],
]) {
    await writeFile(new URL(name, icons), await renderIcon(size, crop));
}

const launcher = await readFile(new URL('android-chrome-512x512.png', icons));
const mark = await sharp(launcher).resize(512, 512).png().toBuffer();

const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [density, size] of Object.entries(sizes)) {
    const dir = new URL(`mipmap-${density}/`, resources);
    const square = await sharp(launcher).resize(size, size).png().toBuffer();
    const circle = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`);
    const round = await sharp(square).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
    await writeFile(new URL('ic_launcher.png', dir), square);
    await writeFile(new URL('ic_launcher_round.png', dir), round);
}

const drawables = new URL('drawable-nodpi/', resources);
await mkdir(drawables, { recursive: true });
await writeFile(new URL('techhome_mark.png', drawables), mark);
// 108 dp layers at 4x density with the mark inside the central 66 dp safe zone.
const foreground = await sharp(await readFile(new URL('techhome_launcher_foreground.png', drawables)))
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(284, 284, { fit: 'contain', background: '#00000000' })
    .extend({ top: 74, bottom: 74, left: 74, right: 74, background: '#00000000' })
    .png()
    .toBuffer();
await writeFile(new URL('techhome_launcher_foreground.png', drawables), foreground);

const bannerLogo = await readFile(new URL('../images/tech-home-tv-logo.png', icons));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <rect width="320" height="180" fill="#1b1c1c"/>
    <image href="data:image/png;base64,${bannerLogo.toString('base64')}" x="18" y="38" width="284" height="104" preserveAspectRatio="xMidYMid meet"/>
    <text x="160" y="158" fill="#b7b9bb" text-anchor="middle" font-family="Arial, sans-serif" font-size="13">Android TV · Fire TV</text>
</svg>`;
const banner = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(new URL('drawable/banner.png', resources), banner);
