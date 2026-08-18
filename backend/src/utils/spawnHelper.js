const spawn = require('cross-spawn');

function execCliCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    
    let stdout = '';
    let stderr = '';
    
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }
    
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }
    
    child.on('error', (err) => {
      reject(err);
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(`Command failed with code ${code}`);
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

module.exports = { execCliCommand };
