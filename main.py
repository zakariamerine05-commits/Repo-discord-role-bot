import discord
from discord.ext import commands
from discord import app_commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

# ===== ضع بياناتك هنا =====
CONFIG = {
    'welcome_channel': 'الترحيب',  # اسم قناة الترحيب
    'roles': {
        '🎮 ألعاب': '123456789012345678',  # ID الدور
        '📚 دراسة': '987654321098765432',
        '💼 عمل': '111111111111111111', 
        '🎵 موسيقى': '222222222222222222'
    }
}

@bot.event
async def on_ready():
    print(f'✅ {bot.user} يعمل!')
    try:
        synced = await bot.tree.sync()
        print(f'✅ {len(synced)} أمر مسجل')
    except Exception as e:
        print(f'❌ خطأ: {e}')

@bot.event
async def on_member_join(member):
    guild = member.guild
    channel = discord.utils.get(guild.channels, name=CONFIG['welcome_channel'])
    
    if not channel:
        print('❌ قناة الترحيب غير موجودة')
        return
    
    embed = discord.Embed(
        title=f'🎉 مرحباً {member.mention}!',
        description='**اختر اهتماماتك:**',
        color=0x5865F2
    )
    embed.add_field(
        name='📋 الخيارات', 
        value=' | '.join(CONFIG['roles'].keys()), 
        inline=False
    )
    embed.set_thumbnail(url=member.display_avatar.url)
    
    select = discord.Select(
        placeholder='اضغط للاختيار...',
        options=[
            discord.SelectOption(
                label=name, 
                description=f'قنوات {name}', 
                emoji=name[0],
                value=str(role_id)
            ) for name, role_id in CONFIG['roles'].items()
        ]
    )
    select.callback = role_callback
    
    view = discord.ui.View()
    view.add_item(select)
    
    await channel.send(embed=embed, view=view)

async def role_callback(interaction):
    role_id = int(interaction.values[0])
    role = interaction.guild.get_role(role_id)
    
    if not role:
        await interaction.response.send_message('❌ الدور غير موجود!', ephemeral=True)
        return
    
    try:
        await interaction.user.add_roles(role)
        await interaction.response.edit_message(
            embed=discord.Embed(
                title='✅ تم!',
                description=f'✅ حصلت على **{role.name}**\n🎉 مرحباً!',
                color=0x00FF00
            ),
            view=None
        )
        print(f'✅ {interaction.user} → {role.name}')
    except:
        await interaction.response.send_message('❌ خطأ في الصلاحيات!', ephemeral=True)

bot.run(os.getenv('TOKEN'))
