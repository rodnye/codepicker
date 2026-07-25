#!/usr/bin/env node

import { main } from './main';
import { pickFiles, PickOptions } from './pick';
import { applyFiles, parseCodeBlocks, ApplyResult } from './apply';

export { pickFiles, applyFiles, parseCodeBlocks };
export type { PickOptions, ApplyResult };

// if CLI
if (require.main === module) {
  main();
}
