module.exports = {
    name: 'echo',
    description: 'reapeat message',
    commandOptions: null,
    global: true,
    run: async(interaction, client) => {
        
        const description = args.find(arg => arg.name.toLowerCase() == "content").value;
            const embed = new discord.MessageEmbed()
                .setTitle("Echo!")
                .setDescription(description)
                .setAuthor(interaction.member.user.username);

            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction, embed)
                }
            });
        }
    }
