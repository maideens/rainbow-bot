var discord = require('discord.js');
var fs = require('fs');
var randomColour = require('randomcolor');
var Config = require('./config.json');


class Bot {
    constructor(){
        this.servers = require('./servers.json');
        this.discordClient = new discord.Client({sync: true});
        
        this.discordClient.on("ready", () => {this.initialize();});
        
        this.discordClient.on("message", (msg) => {this.processMessage(msg)});
        
        this.discordClient.login(Config.discord_token);
    }
    
    initialize() {
        this.log("Discord'a erişim sağlandı.");
        this.log("Komut [>rainbow (roladı)]");
        
        setInterval(() => {
            this.randomizeRoleColors();
        }, Config.randomize_delay*1000);
    }
    
    processMessage(msg) {
        if(msg.content.startsWith(">rainbow")) {
            for(var role of msg.mentions.roles.array()) {
                msg.reply( role + " adlı rol için gökkuşağı başladı." );
                
                this.addRainbowRole(msg.guild.id, role.id);
            }
        }
    }
    
    randomizeRoleColors() {
        for(var server in this.servers) {
            var liveGuild = this.discordClient.guilds.get(server);
            
            if (!liveGuild) {
                this.error( server + " kimliğindeki sunucunun silinmesi veya botun sunucudan atılması nedeniyle uygulamayı gerçekleştiremiyorum.");
                continue;
            }
            
            for(var role of this.servers[server]) {
                var liveRole = liveGuild.roles.get(role);
                
                liveRole.setColor(randomColour(), "Rol rengi değiştirildi.");
            }
        }
    }
    
    addRainbowRole(guild, role) {
        if(this.servers[guild] == undefined) {
            this.servers[guild] = [];
        }
        
        for(var existingRole of this.servers[guild]) {
            if(existingRole == role) {
                return "Bu rol zaten kayıtlı, eğer bir sorun olduğunu düşünüyorsan bot sahibine belirt.";
            }
        }
        
        this.servers[guild].push(role);
        this.saveServers();
    } 
    
    saveServers() {
        fs.writeFileSync("./servers.json", JSON.stringify(this.servers), "utf8");
        this.log("Yeni sunucu kaydedildi.");
    }
    
    log(message) {
        console.log("\x1b[32mBILGI\x1b[37m - \x1b[0m" + message);
    }
    
    error(message) {
        console.log("\x1b[31mHATA\x1b[37m - \x1b[0m" + message);
    }
}

var instance = new Bot();