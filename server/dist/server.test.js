import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, 'bots', 'registry.json');
describe('Bot Registry', () => {
    it('should load the registry JSON file', async () => {
        const data = await fs.readFile(registryPath, 'utf-8');
        const registry = JSON.parse(data);
        assert.ok(Array.isArray(registry), 'Registry should be an array');
        assert.ok(registry.length > 0, 'Registry should not be empty');
    });
    it('should have valid bot entries', async () => {
        const data = await fs.readFile(registryPath, 'utf-8');
        const registry = JSON.parse(data);
        registry.forEach(bot => {
            assert.ok(bot.id, `Bot ${bot.name} missing id`);
            assert.ok(bot.name, `Bot ${bot.id} missing name`);
            assert.ok(bot.system_prompt, `Bot ${bot.id} missing system_prompt`);
            assert.ok(Array.isArray(bot.few_shots), `Bot ${bot.id} few_shots should be an array`);
        });
    });
});
