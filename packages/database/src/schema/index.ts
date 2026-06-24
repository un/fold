export * from "./core"
export * from "./edition"

import { coreTables } from "./core"
import { editionTables } from "./edition"

export const schema = {
  ...coreTables,
  ...editionTables,
}
