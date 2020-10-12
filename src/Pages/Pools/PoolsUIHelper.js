export const defaultSorted = [{ dataField: "id", order: "asc" }];
export const sizePerPageList = [
    { text: "3", value: 3 },
    { text: "5", value: 5 },
    { text: "10", value: 10 },
    { text: "20", value: 20 }
];
export const initialFilter = {
    filter: {
        platform: 'all',
        tags: ''
    },
    sortOrder: "asc", // asc||desc
    sortField: "id",
    pageNumber: 1,
    pageSize: 10
};
