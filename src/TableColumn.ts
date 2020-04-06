export interface ITableColumn {
    name: string;
    label: string;
}

export class TableColumn implements ITableColumn {
    readonly id: number;

    /**
     * Constructs a new Table Column
     * @param name The columns name
     * @param label The columns display name
     * @param id The columns numerical id 
     */
    constructor(public name: string, public label: string, id: number) {
        this.id = id;
    };

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            label: this.label
        };
    }

    /**
     * Get the columns name and label
     */
    get info(): ITableColumn {
        return {
            name: this.name,
            label: this.label
        }
    }

    /**
     * Returns an array of TableColumn objects from an array of generic ITableColumn objects
     * @param columnArray An array of objects implementing ITableColumn
     */
    static FromArray(columnArray: Array<ITableColumn>) {
        let columns = [] as Array<TableColumn>;
        columnArray.forEach(
            (column, i) => columns.push(new TableColumn(column.name, column.label, i))
        );
        return columns;
    }

    static GetNameFromElement(column: JQuery<HTMLElement>): string
    {
        let name = column.data("column");
        if (name) return name;
        else{
            let contents = column.text().toLowerCase();
            //TRIM ANY EXTRA WHITESPACE
            contents = contents.trim();
            //STRIP ANY TRAILING COLONS
            contents = contents.replace(/:\s*$/g, "");
            //REPLACE MIDDLE WHITESPACE WITH _
            contents = contents.replace(/\s/g, "_");
            return contents;
        }
    }
}
