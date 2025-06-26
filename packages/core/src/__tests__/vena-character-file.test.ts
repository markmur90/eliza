import { describe, expect, it } from 'bun:test';
import { parseAndValidateCharacter } from '../schemas/character';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Vena character file', () => {
  it('should parse and validate successfully', () => {
    const charPath = path.resolve(__dirname, '../../../../characters/vena.json');
    const data = fs.readFileSync(charPath, 'utf-8');
    const result = parseAndValidateCharacter(data);
    expect(result.success).toBe(true);
  });
});
