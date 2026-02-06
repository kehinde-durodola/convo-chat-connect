const AVATAR_COLORS = [
    "hsl(210, 70%, 50%)",
    "hsl(280, 70%, 50%)",
    "hsl(350, 70%, 50%)",
    "hsl(150, 70%, 50%)",
    "hsl(30, 70%, 50%)",
    "hsl(180, 70%, 50%)",
    "hsl(320, 70%, 50%)",
    "hsl(60, 70%, 50%)",
];

export function generateInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateAvatarColor(): string {
    const randomIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
    return AVATAR_COLORS[randomIndex];
}

export function generateUsername(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 15);
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${base}${randomSuffix}`;
}
