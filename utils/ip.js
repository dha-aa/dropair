import {networkInterfaces} from "os"

export default function getIp() {
    /**
     * It return loal ip adress
     */
    for(const networks of Object.values(networkInterfaces())){
        for(const network of networks) {
            if(network.family == "IPv4"&& !network.internal){
                return network.address 
            }
        }
    }
}