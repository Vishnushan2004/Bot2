
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB setup (free database)
mongoose.connect(process.env.mongodb+srv://cluster0.zzj0lem.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// User data storage
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: String,
  balance: { type: Number, default: 0 },
  lastMine: Date,
  referrals: [Number],
  miningPower: { type: Number, default: 1 }
});
const User = mongoose.model('User', userSchema);

const bot = new Telegraf(process.env.7427825627:AAGg3fAuRUndl5lV1KL7XlWvHDVHt2guiJI);

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  let user = await User.findOne({ userId }) || new User({ userId, username });
  await user.save();
  
  ctx.reply(`🤑 Welcome to *Cheetah Miner*! 🐆\n\n` +
            `💰 Balance: *${user.balance} CHT*\n` +
            `⛏️ Mine: /mine\n` +
            `📊 Stats: /stats\n` +
            `🔗 Referral: /referral`);
});

// Mine command
bot.command('mine', async (ctx) => {
  const userId = ctx.from.id;
  const user = await User.findOne({ userId }) || new User({ userId });
  
  const now = new Date();
  const cooldown = 60 - Math.floor((now - (user.lastMine || 0)) / 1000);
  
  if (cooldown > 0) {
    return ctx.reply(`⏳ Wait *${cooldown}s* before mining again!`);
  }
  
  const mined = Math.floor(user.miningPower * (1 + Math.random() * 2));
  user.balance += mined;
  user.lastMine = now;
  await user.save();
  
  ctx.reply(`⛏️ You mined *${mined} CHT*!\n` +
            `💰 New balance: *${user.balance} CHT*`);
});

// Referral command
bot.command('referral', async (ctx) => {
  const userId = ctx.from.id;
  const botName = (await bot.telegram.getMe()).username;
  const referralLink = `https://t.me/${botName}?start=${userId}`;
  
  ctx.reply(`📢 Invite friends and earn *+0.5 mining power* per referral!\n\n` +
            `🔗 Your link:\n${referralLink}`);
});

// Stats command
bot.command('stats', async (ctx) => {
  const userId = ctx.from.id;
  const user = await User.findOne({ userId }) || new User({ userId });
  
  ctx.reply(`📊 *Cheetah Miner Stats* 🐆\n\n` +
            `💰 Balance: *${user.balance} CHT*\n` +
            `⚡ Mining Power: *${user.miningPower}*\n` +
            `👥 Referrals: *${user.referrals.length}*`);
});

bot.launch();
console.log('🚀 Cheetah Miner Bot is running!');
