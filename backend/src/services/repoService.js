const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

function getGithubZipUrl(repoUrl) {
    let url = repoUrl.trim();
    if (url.endsWith('/')) url = url.slice(0, -1);
    return `${url}/archive/refs/heads/main.zip`;
}

const extractLocalZip = async (zipFilePath) => {
    const extractedDir = path.join(__dirname, '../../uploads/extracted', `${Date.now()}`);

    if (!fs.existsSync(extractedDir)) {
        fs.mkdirSync(extractedDir, { recursive: true });
    }

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractedDir, true);

    return extractedDir;
};

const downloadAndExtractGithub = async (repoUrl) => {
    const downloadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const zipFilePath = path.join(downloadsDir, `${Date.now()}-github-repo.zip`);

    let response;
    try {
        const zipUrlMain = getGithubZipUrl(repoUrl);
        response = await axios({
            url: zipUrlMain,
            method: 'GET',
            responseType: 'arraybuffer'
        });
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.log('Main branch not found, falling back to master branch...');
            let url = repoUrl.trim();
            if (url.endsWith('/')) url = url.slice(0, -1);
            const zipUrlMaster = `${url}/archive/refs/heads/master.zip`;
            try {
                response = await axios({
                    url: zipUrlMaster,
                    method: 'GET',
                    responseType: 'arraybuffer'
                });
            } catch (err2) {
                throw new Error("Repository not found or is private. If private, please use Local Upload mode instead.");
            }
        } else {
            throw new Error("Failed to download repository: " + err.message);
        }
    }

    fs.writeFileSync(zipFilePath, response.data);

    return await extractLocalZip(zipFilePath);
};

module.exports = {
    extractLocalZip,
    downloadAndExtractGithub
};
