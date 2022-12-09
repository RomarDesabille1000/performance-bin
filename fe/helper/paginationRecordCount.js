
export const PAGINATION_COUNT = 6

export function paginationRecordCount(pageIndex, total){
    if(total === undefined) return
    let start = (pageIndex - 1) * PAGINATION_COUNT + 1
    let end = total

    if (PAGINATION_COUNT < total) {
        end = PAGINATION_COUNT * pageIndex
        if (end > total) {
            end = total;
        }
    }

    return `${start} – ${end} of ${total} records`
}