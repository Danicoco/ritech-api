/** @format */

import {
    addDays,
    compareAsc,
    differenceInDays,
    format,
    startOfDay,
} from "date-fns"

export const groupByCreatedAt = <T>(arr: T[]) => {
    arr = arr.sort((a, b) =>
        // @ts-ignore
        compareAsc(new Date(a.createdAt), new Date(b.createdAt))
    )
    return !arr.length
        ? {}
        : arr.reduce((acc: Record<string, any>, item) => {
              // @ts-ignore
              const dateKey = format(new Date(item.createdAt), "dd MMM yyyy")

              if (!acc[dateKey]) {
                  acc[dateKey] = []
              }
              acc[dateKey].push(item)

              return acc
          }, {})
}

export const convertToDateWithoutTimeStamp = (date: string | Date) => {
    return new Date(date).setHours(0, 0, 0, 0)
}

export const filterRecordByDate = <T>(
    records: T[] | null,
    fromDate: string,
    toDate: string
): T[] | null => {
    if (!fromDate && !toDate) return records

    fromDate = startOfDay(new Date(fromDate)).toISOString()
    toDate = addDays(new Date(toDate), 1).toISOString()

    return (
        records?.filter(record => {
            // @ts-ignore
            if (record?.createdAt) {
                const diffFrom = differenceInDays(
                    convertToDateWithoutTimeStamp(fromDate),
                    // @ts-ignore
                    convertToDateWithoutTimeStamp(record.createdAt)
                )

                const diffTo = differenceInDays(
                    convertToDateWithoutTimeStamp(toDate),
                    // @ts-ignore
                    convertToDateWithoutTimeStamp(record.createdAt)
                )

                return diffFrom <= 0 && diffTo >= 0
            }
        }) || []
    )
}
