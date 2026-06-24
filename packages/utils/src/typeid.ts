import { TypeID, typeid } from "typeid-js"
import { v7 as uuidv7 } from "uuid"
import { z } from "zod"

export const TYPE_ID_SUFFIX_LENGTH = 26

const BASE32_REGEX = /^[0-9a-hjkmnp-tv-z]+$/

// TypeID prefixes are persisted in database rows; append new entries instead of changing existing values.
export const idTypesMapNameToPrefix = {
  user: "usr",
} as const

export type IdTypesMap = Record<string, string>
export type TypeIdFromMap<
  TMap extends IdTypesMap,
  TName extends keyof TMap & string,
> = `${TMap[TName]}_${string}`
export type IdTypesMapNameToPrefix = typeof idTypesMapNameToPrefix
export type IdTypePrefixNames = keyof IdTypesMapNameToPrefix
export type UnfoldTypeIdName = IdTypePrefixNames
export type TypeId<TName extends IdTypePrefixNames> = TypeIdFromMap<
  IdTypesMapNameToPrefix,
  TName
>
export type UnfoldTypeId<TName extends UnfoldTypeIdName> = TypeId<TName>

export function createTypeIdSystem<const TMap extends IdTypesMap>(
  typeMap: TMap,
) {
  type IdTypeName = keyof TMap & string
  type IdTypePrefix = TMap[IdTypeName] & string
  type ScopedTypeId<TName extends IdTypeName> = TypeIdFromMap<TMap, TName>

  const prefixToName = Object.fromEntries(
    Object.entries(typeMap).map(([name, prefix]) => [prefix, name]),
  ) as Record<IdTypePrefix, IdTypeName>

  const schema = <const TName extends IdTypeName>(typeName: TName) => {
    const expectedPrefix = typeMap[typeName]
    const expectedLength =
      TYPE_ID_SUFFIX_LENGTH + expectedPrefix.length + 1

    return z
      .string()
      .length(expectedLength, {
        message: `TypeID must be ${expectedLength} characters (${expectedPrefix}_<26 char suffix>)`,
      })
      .startsWith(`${expectedPrefix}_`, {
        message: `TypeID must start with '${expectedPrefix}_'`,
      })
      .refine(
        (input) => {
          const suffix = input.slice(expectedPrefix.length + 1)
          return BASE32_REGEX.test(suffix)
        },
        { message: "TypeID suffix contains invalid base32 characters" },
      )
      .refine(
        (input) => {
          try {
            TypeID.fromString(input)
            return true
          } catch {
            return false
          }
        },
        { message: "TypeID is structurally invalid" },
      )
      .transform(
        (input) => TypeID.fromString(input).toString() as ScopedTypeId<TName>,
      )
  }

  const generator = <const TName extends IdTypeName>(
    typeName: TName,
  ): ScopedTypeId<TName> =>
    typeid(typeMap[typeName]).toString() as ScopedTypeId<TName>

  const validator = <const TName extends IdTypeName>(
    typeName: TName,
    data: unknown,
  ): data is ScopedTypeId<TName> => schema(typeName).safeParse(data).success

  const infer = (input: `${IdTypePrefix}_${string}`): IdTypeName => {
    const parsed = TypeID.fromString(input)
    const prefix = parsed.getType() as IdTypePrefix
    const typeName = prefixToName[prefix]

    if (typeName === undefined) {
      throw new Error(
        `Unknown TypeID prefix '${prefix}'. Registered prefixes: ${Object.keys(prefixToName).join(", ")}`,
      )
    }

    return typeName
  }

  const fromString = <const TName extends IdTypeName>(
    typeName: TName,
    input: string,
  ): ScopedTypeId<TName> => {
    const parsed = TypeID.fromString(input)
    const expectedPrefix = typeMap[typeName]
    const actualPrefix = parsed.getType()

    if (actualPrefix !== expectedPrefix) {
      throw new Error(
        `TypeID prefix mismatch: expected '${expectedPrefix}' but got '${actualPrefix}'`,
      )
    }

    return parsed.toString() as ScopedTypeId<TName>
  }

  const generatorWithTimestamp = <const TName extends IdTypeName>(
    typeName: TName,
    timestamp?: Date | number,
  ): ScopedTypeId<TName> => {
    const msecs =
      timestamp === undefined
        ? Date.now()
        : timestamp instanceof Date
          ? timestamp.getTime()
          : timestamp

    if (!Number.isFinite(msecs)) {
      throw new Error(`Invalid timestamp: expected finite number, got ${msecs}`)
    }

    if (msecs < 0) {
      throw new Error(
        `Invalid timestamp: expected non-negative number, got ${msecs}`,
      )
    }

    const uuid = uuidv7({ msecs })
    return TypeID.fromUUID(typeMap[typeName], uuid).toString() as ScopedTypeId<TName>
  }

  const columnLength = <const TName extends IdTypeName>(typeName: TName) =>
    typeMap[typeName].length + 1 + TYPE_ID_SUFFIX_LENGTH

  return {
    schema,
    generator,
    generatorWithTimestamp,
    validator,
    infer,
    fromString,
    suffixLength: TYPE_ID_SUFFIX_LENGTH,
    prefix: typeMap,
    columnLength,
  }
}

export const typeId = createTypeIdSystem(idTypesMapNameToPrefix)

export function createUnfoldTypeId<TName extends UnfoldTypeIdName>(
  name: TName,
): UnfoldTypeId<TName> {
  return typeId.generator(name)
}

export function normalizeUnfoldTypeId<TName extends UnfoldTypeIdName>(
  name: TName,
  value: string,
): UnfoldTypeId<TName> {
  return typeId.fromString(name, value)
}

export function isUnfoldTypeId<TName extends UnfoldTypeIdName>(
  name: TName,
  value: unknown,
): value is UnfoldTypeId<TName> {
  return typeId.validator(name, value)
}
