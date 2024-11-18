const fs = require('fs');
const path = require('path');
const configs = require('./config');

// get language
const getLanguage = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.js':
            return 'javascript';
        case '.py':
            return 'python';
        case '.java':
            return 'java';
        case '.ts':
            return 'typescript';
        case '.ex':
        case '.exs':
            return 'elixir';
        case '.php':
            return 'php';
        case '.c':
            return 'c';
        case '.cpp':
            return 'cpp';
        default:
           console.log(`Unsupported file type: ${ext}`);
    }
};

const codeLineCounter = (filePath) => {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const lines = fileData.split('\n');
    const lang = getLanguage(filePath);
    const syntaxConfig = configs.syntaxConfig[lang];
    if (!syntaxConfig) {
        console.log('Language not identified');
        return;
    }

    let blankLinesCount = 0; 
    let commentLinesCount = 0; 
    let codeLinesCount = 0; 
    let isMultiLineComment = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim(); // trim the line contain to cleaned up data.
        if(!line) {
            // first check blank line.
            blankLinesCount++; 
        } else if(isMultiLineComment) {
            // check if multi line comment is continues
            commentLinesCount++;
            // check if line is having closing statment for comment
            if (line.endsWith(syntaxConfig.multiLineCommentEnd)) {
                isMultiLineComment = false;
            }
        } else if(line.startsWith(syntaxConfig.multiLineCommentStart)) {
            /**
             * check if line is started for multiple comment.
             */
            commentLinesCount++;
            isMultiLineComment = true;
            /** check if line is having closing statment for comment */ 
            if (line.endsWith(syntaxConfig.multiLineCommentEnd)) {
                isMultiLineComment = false;
            }
        } else if (line.startsWith(syntaxConfig.singleLineComment)) {
            // check if line is starting with single line comment
            commentLinesCount++;
        } else {
            // This is the code line
            codeLinesCount++;
        }
    }
 
    console.log(`Blank: ${blankLinesCount}`); 
    console.log(`Comments: ${commentLinesCount}`); 
    console.log(`Code: ${codeLinesCount}`); 
    console.log(`Total: ${blankLinesCount + commentLinesCount + codeLinesCount}`);
}

console.log('--------- Single File Processing ----------------');
codeLineCounter('index.js');

const processDirectory = (directoryPath) => {
    fs.readdirSync(directoryPath).forEach(file => {
        const fullPath = path.join(directoryPath, file);
        console.log(`File: ${fullPath}`);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else {
            codeLineCounter(fullPath);
        }
    });
};

console.log('--------- Multi File Processing ----------------');
processDirectory('../file-read');
