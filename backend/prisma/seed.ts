import { PrismaClient, ConversationType } from "@prisma/client";

const prisma = new PrismaClient();

const defaultGroups = [
    {
        name: "General Chat",
        icon: "💬",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        about: "General discussions and announcements",
    },
    {
        name: "Tech Talk",
        icon: "💻",
        iconBg: "bg-gradient-to-br from-purple-400 to-purple-600",
        about: "Technology, programming, and gadgets",
    },
    {
        name: "Movie Lounge",
        icon: "🎬",
        iconBg: "bg-gradient-to-br from-red-400 to-red-600",
        about: "Movies, reviews, and recommendations",
    },
    {
        name: "TV & Series Hub",
        icon: "📺",
        iconBg: "bg-gradient-to-br from-green-400 to-green-600",
        about: "TV shows and series discussions",
    },
    {
        name: "Pop Culture & Gaming",
        icon: "🎮",
        iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
        about: "Gaming, anime, comics, and pop culture",
    },
];

async function main() {
    console.log("Seeding database...");

    for (const group of defaultGroups) {
        const existing = await prisma.conversation.findFirst({
            where: {
                type: ConversationType.group,
                name: group.name,
            },
        });

        if (!existing) {
            await prisma.conversation.create({
                data: {
                    type: ConversationType.group,
                    name: group.name,
                    icon: group.icon,
                    iconBg: group.iconBg,
                    about: group.about,
                },
            });
            console.log(`Created group: ${group.name}`);
        } else {
            console.log(`Group already exists: ${group.name}`);
        }
    }

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
