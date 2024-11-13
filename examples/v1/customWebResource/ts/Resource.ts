import * as webFSManager from './FSManager'
import axios from 'axios';
import * as webdav from 'webdav-server'

export class WebFile extends webdav.StandardResource
{
    fileName : string
    webUrl : string
    len : number
    lenUpdateTime : number
    refreshTimeoutMs : number

    constructor(webUrl : string, fileName : string, refreshTimeoutMs : number = 10000)
    {
        super(null, new webFSManager.WebFSManager());

        this.refreshTimeoutMs = refreshTimeoutMs;
        this.lenUpdateTime = 0;
        this.fileName = fileName;
        this.webUrl = webUrl;
        this.len = -1;
    }

    openReadStream() {
        return axios({
            method: 'get',
            url: this.webUrl,
            responseType: 'stream'
        })
        .then(response => {
            const stream = response.data;
            let size = 0;

            stream.on('data', (chunk) => {
                size += chunk.length;
            });

            stream.on('end', () => {
                this.len = size;
                this.lenUpdateTime = Date.now();
            });

            return stream;
        })
        .catch(error => {
            console.error('Error fetching the stream:', error.message);
            throw error;
        });
    }

    create(callback)
    {
        callback();
    }
    
    delete(callback)
    {
        webdav.StandardResource.standardRemoveFromParent(this, callback);
    }

    moveTo(parent, newName, overwrite, callback)
    {
        webdav.StandardResource.standardMoveTo(this, parent, newName, overwrite, callback);
    }

    rename(newName, callback)
    {
        const oldname = this.fileName;
        this.fileName = newName;
        callback(null, oldname, newName);
    }

    write(targetSource, callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }

    read(targetSource, callback)
    {
        callback(null, this.openReadStream());
    }
    
    mimeType(targetSource, callback)
    {
        webdav.StandardResource.standardMimeType(this, targetSource, callback);
    }
    
    size(targetSource, callback)
    {
        if(this.len >= 0 && Date.now() - this.lenUpdateTime < this.refreshTimeoutMs)
        {
            callback(null, this.len);
            return;
        }

        const stream = this.openReadStream();
        stream.on('end', () => callback(null, this.len));
    }

    webName(callback)
    {
        callback(null, this.fileName);
    }

    type(callback)
    {
        callback(null, webdav.ResourceType.File);
    }
    
    addChild(resource, callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }
    removeChild(resource, callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }
    getChildren(callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }
}
