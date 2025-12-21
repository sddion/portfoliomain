const express = require('express');
const cors = require('cors');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const BOARD_FQBN = {
    'ESP32 Dev Module': 'esp32:esp32:esp32',
    'ESP32-S2 Dev Module': 'esp32:esp32:esp32s2',
    'ESP32-S3 Dev Module': 'esp32:esp32:esp32s3',
    'ESP32-C3 Dev Module': 'esp32:esp32:esp32c3',
    'NodeMCU-32S': 'esp32:esp32:nodemcu-32s',
    'Generic ESP8266 Module': 'esp8266:esp8266:generic',
    'NodeMCU 1.0': 'esp8266:esp8266:nodemcuv2',
    'Wemos D1 Mini': 'esp8266:esp8266:d1_mini',
    'Arduino Uno': 'arduino:avr:uno',
    'Arduino Mega': 'arduino:avr:mega',
    'Arduino Nano': 'arduino:avr:nano',
};

app.get('/health', (req, res) => {
    res.json({ status: 'ok', boards: Object.keys(BOARD_FQBN) });
});

app.post('/compile', async (req, res) => {
    const { sketch, fqbn, libraries = [], verbose = false } = req.body;

    if (!sketch) {
        return res.status(400).json({ success: false, errors: ['No sketch provided'] });
    }

    const boardFqbn = BOARD_FQBN[fqbn] || fqbn || 'esp32:esp32:esp32';
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arduino-'));
    const sketchDir = path.join(tmpDir, 'sketch');
    const buildDir = path.join(tmpDir, 'build');

    fs.mkdirSync(sketchDir);
    fs.mkdirSync(buildDir);
    fs.writeFileSync(path.join(sketchDir, 'sketch.ino'), sketch);

    const output = [];
    const errors = [];
    const warnings = [];

    try {
        // Install requested libraries
        for (const lib of libraries) {
            try {
                execSync(`arduino-cli lib install "${lib}"`, { timeout: 60000 });
                output.push(`Installed library: ${lib}`);
            } catch (e) {
                warnings.push(`Failed to install library: ${lib}`);
            }
        }

        // Compile
        const verboseFlag = verbose ? '-v' : '';
        const cmd = `arduino-cli compile --fqbn ${boardFqbn} --output-dir ${buildDir} ${verboseFlag} ${sketchDir}`;

        output.push(`Compiling for ${boardFqbn}...`);

        const compileOutput = execSync(cmd, {
            timeout: 300000,
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024
        });

        output.push(...compileOutput.split('\n').filter(l => l.trim()));

        // Find binary
        const files = fs.readdirSync(buildDir);
        const binFile = files.find(f => f.endsWith('.bin'));
        const hexFile = files.find(f => f.endsWith('.hex'));
        const binaryFile = binFile || hexFile;

        if (!binaryFile) {
            return res.json({
                success: false,
                errors: ['Compilation succeeded but no binary found'],
                output
            });
        }

        const binaryPath = path.join(buildDir, binaryFile);
        const binaryData = fs.readFileSync(binaryPath);
        const binaryBase64 = binaryData.toString('base64');
        const size = binaryData.length;

        output.push(`Compilation complete. Binary size: ${size} bytes`);

        // Cleanup
        fs.rmSync(tmpDir, { recursive: true, force: true });

        res.json({
            success: true,
            binary: binaryBase64,
            size,
            warnings,
            output
        });

    } catch (error) {
        const errorMsg = error.stderr || error.stdout || error.message;
        errors.push(...errorMsg.split('\n').filter(l => l.includes('error')));

        if (errors.length === 0) {
            errors.push(errorMsg.substring(0, 500));
        }

        // Cleanup
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }

        res.json({
            success: false,
            errors,
            warnings,
            output
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Arduino Compile Server running on port ${PORT}`);
    console.log(`Supported boards: ${Object.keys(BOARD_FQBN).join(', ')}`);
});
