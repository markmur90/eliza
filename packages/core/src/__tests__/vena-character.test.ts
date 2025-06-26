import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { parseAndValidateCharacter } from '../schemas/character';

const characterPath = path.resolve(__dirname, '../../../../characters/vena.json');

describe('Vena character JSON', () => {
  it('should parse and validate successfully', () => {
    const json = fs.readFileSync(characterPath, 'utf8');
    const result = parseAndValidateCharacter(json);
    expect(result.success).toBe(true);
  });
});
