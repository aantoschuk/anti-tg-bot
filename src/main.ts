import "dotenv/config";
import { CONFIG } from "./config";
import { Telegraf } from "telegraf";

const token = CONFIG.TELEGRAM_API_BOT_TOKEN;

const main = () => {
    if (token) {
        let flag = false;
        const bot = new Telegraf(token);

        bot.start((context) => context.reply("Анті-Бота запущено"));

        bot.on("new_chat_members", (context) => {
            const newMembers = context.message.new_chat_members;

            newMembers.forEach(async (member) => {
                if (member.is_bot) {
                    try {
                        // Mute the new member by restricting their permissions
                        await context.telegram.restrictChatMember(
                            context.chat.id, // The chat ID (group)
                            member.id, // The user's ID
                            {
                                can_send_messages: false, // Mutes the user (can't send messages)
                                can_send_media_messages: false, // Mutes media (photos, videos, etc.)
                                can_send_polls: false, // Mutes polls
                                can_send_other_messages: false, // Mutes other messages like contact, location
                                can_add_web_page_previews: false, // Prevents sending links with previews
                                can_send_audio: false, // Mutes audio messages
                                can_send_documents: false, // Mutes document uploads
                                can_send_stickers: false, // Mutes sticker sending
                            },
                        );
                        context.reply(
                            "Нового участника чату було замʼючено бо він бот",
                        );
                    } catch (error) {
                        console.log(error);
                        context.reply("Не можу замутити бота");
                    }
                }
            });
        });

        bot.command("mute", (context) => {
            console.log("mute");
            flag = !flag;
            context.reply(
                `Відтепер повідомлення від ботів ${flag ? "не " : ""}будуть видалятися`,
            );
        });

        bot.on("message", async (context) => {
            const user = context.message.from;
            const msgId = context.message.message_id;
            if (user.is_bot && flag) {
                await context.deleteMessage(msgId);
            }
        });

        bot.launch();

        process.once("SIGINT", () => bot.stop("SIGINT"));
        process.once("SIGTERM", () => bot.stop("SIGTERM"));
    }
    console.error("No Token");
};

main();
