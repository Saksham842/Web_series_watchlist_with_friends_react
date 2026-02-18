// Generates a consistent gradient + initial avatar based on the user's name
const AVATAR_GRADIENTS = [
    ['#e53e3e', '#c53030'], // red
    ['#d69e2e', '#b7791f'], // amber
    ['#38a169', '#276749'], // green
    ['#3182ce', '#2b6cb0'], // blue
    ['#805ad5', '#6b46c1'], // purple
    ['#dd6b20', '#c05621'], // orange
    ['#319795', '#2c7a7b'], // teal
    ['#e53e8c', '#b83280'], // pink
];

export function getAvatarGradient(name = '') {
    const index = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
    const [from, to] = AVATAR_GRADIENTS[index];
    return `linear-gradient(135deg, ${from}, ${to})`;
}

export function getAvatarInitial(name = '') {
    return name?.charAt(0)?.toUpperCase() || '?';
}
