const { Client, Collection } = require('discord.js');
const { APIMessage } = require('discord.js');
const {readdirSync} = require('fs');
const config = require('./config.json');
const fs = require('fs')
const keepAlive = require("./server.js")
keepAlive()
const client = new Client();
client.intcommands = new Collection();

client.once('ready', async () => {

  console.log(`\nLogged in : ${client.user.tag}\n`)

  try {
    readdirSync('./ints').forEach(dir => {
      const commandFiles = readdirSync(`./ints/${dir}`).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const commandSlash = require(`./commands/${dir}/${file}`);
        client.api.applications(client.user.id).guilds(config.guildID).commands.post({
          data: {
            name: commandSlash.name,
            description: commandSlash.description,
            options: commandSlash.commandOptions
          }
        })
        if (commandSlash.global == true) {
          client.api.applications(client.user.id).commands.post({
            data: {
            name: commandSlash.name,
            description: commandSlash.description,
            options: commandSlash.commandOptions
          }
          })
        }

        client.intcommands.set(commandSlash.name, commandSlash);
        console.log(`Command POST : ${command.name} from ${file} (${command.global ? "global" : "guild"})`)
      }
      console.log("")
    })
  } catch (error) { console.log(error) }
  let cmdArrGlobal = await client.api.applications(client.user.id).commands.get()
  let cmdArrGuild = await client.api.applications(client.user.id).guilds(config.guildID).commands.get()
  await client.api.applications(client.user.id).guilds(config.guildID).commands('846013154315730944').delete()
  cmdArrGlobal.forEach(element => {
    console.log("Global command loaded : " + element.name + " (" + element.id + ")")
  });
  console.log("")
  cmdArrGuild.forEach(element => {
    console.log("Guild command loaded : " + element.name + " (" + element.id + ")")
  });
  console.log("")
  async function createAPIMessage(interaction, content) {
    const apiMessage = await APIMessage.create(client.channels.resolve(interaction.channel_id), content)
    .resolveData()
    .resolveFiles();
    return { ...apiMessage.data, files: apiMessage.files };
}});


client.ws.on('INTERACTION_CREATE', async interaction => {

  if (!client.intcommands.has(interaction.data.name)) return;

  try {
    client.intcommands.get(interaction.data.name).run(interaction, client);
  } catch (error) {
    console.log(`Error from command ${interaction.data.name} : ${error.message}`);
    console.log(`${error.stack}\n`)
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: `Sorry, there was an error executing that command!`
        }
      }
    })
  }

})

client.login(config.token);
