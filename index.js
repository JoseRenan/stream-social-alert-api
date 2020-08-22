import Discord from 'discord.js';
import { listen, io, messages } from './src/server.js'
import dotenv from 'dotenv'

dotenv.config()
listen(process.env.BOT_WEBSOCKET_PORT || 3000)
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const ALLOWED_ROLE = 'core'
const RECORD_EMOJI = '⏺️'
const REPEAT_EMOJI = '🔁'
const ALLOWED_EMOJIS = [REPEAT_EMOJI, RECORD_EMOJI]
const CONFIRM_EMOJI = '✅'

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const memberHasRole = (member, role) => member.roles.cache.find(r => r.name === role)
const alreadyReactedWithEmoji = (message, emoji) => message.reactions.cache.find(reaction => reaction.emoji.name === emoji && reaction.me)

const saveAlert = (message) => {
    messages[message.id] = { 
        message: message.cleanContent,
        author: message.author.username,
        avatar: message.author.avatarURL(),
        source: 'discord',
        id: message.id,
        timestamp: message.createdTimestamp
    }
    io.emit('newAlert', messages[message.id])
}

const addAlertIterator = (message) => {
    io.emit('addAlertIterator', { 
        message: message.cleanContent,
        author: message.author.username,
        avatar: message.author.avatarURL(),
        source: 'discord',
        id: message.id,
        timestamp: message.createdTimestamp
    })
}

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) await reaction.fetch()
    if (!ALLOWED_EMOJIS.find((emoji) => reaction.emoji.name === emoji)) return;
    if (reaction.message.partial) await message.fetch();
    const message = reaction.message;
    const member = await message.guild.members.fetch(user);
    if (!memberHasRole(member, ALLOWED_ROLE) || alreadyReactedWithEmoji(message, CONFIRM_EMOJI)) return;
    if (reaction.emoji.name === RECORD_EMOJI) saveAlert(message)
    if (reaction.emoji.name === REPEAT_EMOJI) addAlertIterator(message)
    message.react(CONFIRM_EMOJI)
});

client.login(process.env.BOT_DISCORD_TOKEN || '')