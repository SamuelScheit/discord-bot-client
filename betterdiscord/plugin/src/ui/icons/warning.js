/**
 * Warning Icon
 * @param {number} size - Size of the icon.
 */
export default function(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>`;
}