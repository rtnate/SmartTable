
import{ TableRow } from "./TableRow";
import{ ITableColumn, TableColumn} from "./TableColumn";

export{ TableRow } from "./TableRow";
export{ ITableColumn, TableColumn} from "./TableColumn";

export class TableData{

    private dataColumns: Array<ITableColumn> = [];
    private dataRows: Array<TableRow> = [];
    private selectedRow: number | null = null;
    
    constructor(){}

    /**
     * Get the array of TableColumn 's 
     */
    get columns(){ return TableColumn.FromArray(this.dataColumns); };

    /** 
     * The number of columns in the table
     */
    get noColumns(){ return this.dataColumns.length };

    /**
     * Get's a column by its numerical index/position
     * @param index The columns numerical index
     */
    column(index: number)
    {
        let col = this.dataColumns[index];
        return new TableColumn(col.name, col.label, index);
    }

    /**
     * Get's a column by name
     * @param name The name of the column
     */
    getColumnByName(name: string)
    {
        let index = this.dataColumns.findIndex(
                        (col, i) => { 
                            if (col.name == name) return true;
                            else return false;
                        });
        if (index < 0) return null;
        let column = this.dataColumns[index];
        return new TableColumn(column.name, column.label, index);
    }

    /**
     * Returns the table data as a generic, non-associated nested array
     */
    plain(){ return this.getDataGeneric(); };

    /**
     * Returns a row by it's numerical index
     * @param index The numerical index of the desired row
     */
    row(index: number){ return this.dataRows[index]; };

    /**
     * Finds a row by its key, returning null if not found
     * @param rowKey The key for the desired row
     */
    key(rowKey: number){
        let row = this.dataRows.find((row) => { return row.key == rowKey });
        if (!row) return null;
        else return row;
    }

    /**
     * Returns the array of TableRows
     */
    rows(){ return this.dataRows; };

    /**
     * Returns an array of raw objects containing the TableRow 's data
     */
    raw(){
        let rawData = Array<any>();
        this.dataRows.forEach(
            (row, i) => {
                let r = row.get();
                rawData[i] = r;
            });
        return rawData;
    }

    /**
     * Add a column to the table
     * @param name The name of the new column
     * @param label The label of the new column
     * @param position The position in which to insert the new column
     */
    addColumn(name: string, label?: string, position?: number)
    {
        if (!label) label = name;
        if (position)
        {
            this.dataColumns.splice(position, 0, {name: name, label: label});
        } else {
            this.dataColumns.push({name: name, label: label})
        }
    }

    /**
     * Adds a new row to the table
     * @param row The new TableRow to add
     * @param index The index (position) in which to insert the new row
     */
    addRow(row: TableRow, index?: number)
    {
        if (typeof(index) == 'number') this.dataRows[index] = row;
        else this.dataRows.push(row);
    }

    /**
     * Sorts the table by a column
     * @param columnName The column to sort by
     * @param descending Set to true to sort descending, omit or false to sort ascending
     */
    sortBy(columnName: string, descending = false)
    {
        let sorter = (a: TableRow, b: TableRow) =>
        {
            try{
                const propA = a.getColumnSortable(columnName);
                const propB = b.getColumnSortable(columnName);
                let comp = 0
                if (propA > propB) comp = 1;
                else if (propA < propB) comp = -1;
                if (descending) comp *= -1;
                return comp;
            }
            catch{
                return 0;
            }
        }
        this.dataRows.sort(sorter);
    }

    sortDefault()
    {
        let sorter = (a: TableRow, b: TableRow) =>
        {
            try{
                const keyA = a.keySortable();
                const keyB = b.keySortable();
                let comp = 0
                if (keyA > keyB) comp = 1;
                else if (keyA < keyB) comp = -1;
                return comp;
            }
            catch{
                return 0;
            }
        }
        this.dataRows.sort(sorter);
    }

    /**
     * Get an HTML representation of the table
     */
    toHTML(){

    }

    /**
     * Get an HTML Table body representing the table data
     */
    toHTMLTableBody(){
        let columns = this.dataColumns;
        let tbody = document.createElement('tbody');
        //Convert each row to a tr
        this.dataRows.forEach(
            (row, index) => {
                let tr = $(document.createElement('tr'));
                if (row.key) tr.data("row", row.key);
                for(let column of columns)
                {
                    let td = $(document.createElement('td'));
                    td.data("column", column.name);
                    let val = row.getColumn(column.name);
                    td.html(val);
                    tr.append(td);
                }
                $(tbody).append(tr);
        });
        return $(tbody).html();
    }

    private getDataGeneric(): Array<string[]>{
        let generic = Array<string[]>();
        this.dataRows.forEach(
            (dataRow, i) => {
                let row = [];
                let r = dataRow.get();
                for(let column in r)
                {
                    row.push(column);
                }
                generic[i] = row;
            }
        );
        return generic;
    }


    selectRow(index: number)
    {
        this.selectedRow = index;
    }

    get selected(){
        if (this.selectedRow != null) return this.dataRows[this.selectedRow];
    }

    toJSON(){
        return this.raw();
    }

}