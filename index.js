require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// ===== ضع بياناتك هنا =====
const CONFIG = {
    welcomeChannel: 'الترحيب', // اسم قناة الترحيب
    roles: {
        '🎮 ألعاب': { id: 'ROLE_ID_1', desc: 'قنوات الألعاب 🎮' },
        '📚 دراسة': { id: 'ROLE_ID_2', desc: 'المواد الدراسية 📚' },
        '💼 عمل': { id: 'ROLE_ID_3', desc: 'فرص العمل 💼' },
        '🎵 موسيقى': { id: 'ROLE_ID_4', desc: 'قنوات الموسيقى 🎵' }
    }
};

client.once('ready', () => console.log(`✅ ${client.user.tag} يعمل!`));

client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(ch => 
        ch.name.toLowerCase().includes(CONFIG.welcomeChannel.toLowerCase())
    );
    
    if (!channel) return console.log('❌ قناة الترحيب غير موجودة');
    
    const embed = new EmbedBuilder()
        .setTitle(`🎉 مرحباً ${member.user.username}!`)
        .setDescription('**اختر اهتماماتك عشان نحصلك على الدور المناسب:**')
        .addFields({ name: '📋 الخيارات:', value: Object.keys(CONFIG.roles).join(' | '), inline: false })
        .setColor('#5865F2')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('role_select')
        .setPlaceholder('اضغط للاختيار...')
        .addOptions(Object.entries(CONFIG.roles).map(([name, data]) => ({
            label: name,
            description: data.desc,
            value: name.replace(/[^\w]/g, '').toLowerCase(),
            emoji: name.split(' ')[0]
        })));

    await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'role_select') return;
    
    const choice = Object.keys(CONFIG.roles).find(role => 
        interaction.values[0] === role.replace(/[^\w]/g, '').toLowerCase()
    );
    
    if (!choice) return interaction.reply({ content: '❌ خطأ!', ephemeral: true });
    
    const roleConfig = CONFIG.roles[choice];
    const role = interaction.guild.roles.cache.get(roleConfig.id);
    
    if (!role) return interaction.reply({ content: `❌ دور ${roleConfig.desc} غير موجود`, ephemeral: true });
    
    try {
        await interaction.member.roles.add(role);
        await interaction.update({
            embeds: [new EmbedBuilder()
                .setTitle('✅ تم!')
                .setDescription(`✅ حصلت على **${roleConfig.desc}**\n🎉 مرحباً في المجتمع!`)
                .setColor('#00FF00')],
            components: []
        });
        console.log(`✅ ${interaction.user.tag} → ${role.name}`);
    } catch (e) {
        interaction.reply({ content: '❌ خطأ في الصلاحيات!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
