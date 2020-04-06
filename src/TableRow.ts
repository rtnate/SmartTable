import { TableColumn } from "./TableColumn";
import $ from 'jquery';

export class TableRow implements Iterable<any>{
    [Symbol.iterator](): Iterator<any> {
        return this.rowData.Symbol.iterator;
    }

    private rowData: any = {};
    private current = 0;

    constructor(){};

    addKey(value: number){
        this.rowData['key'] = value;
    }

    get key(){ return this.rowData['key']; };

    keySortable(){
        let k = this.rowData['key'];
        if (!k) return '';
        else return k;
    }

    addColumn(column: TableColumn, value: any)
    {
        this.rowData[column.name] = value;
    }

    getColumn(columnName: string)
    {
        let data = this.rowData[columnName];
        if (!data) return null;
        else return data;
    }

    /**
     * Get's a columns value as a sortable string, where the string
     * is already converted to lower case.  If the columns value is not found
     * an empty string is returned
     * 
     * @param columnName The name of the column to retrieve from the row
     */
    getColumnSortable(columnName: string): string
    {
        const tagRegex = /(?:<\s*a[^>]*>)(.*?)(?:<\s*\/\s*a>)/;
        let data = this.rowData[columnName];
        if (!data) return '';
        if (tagRegex.test(data)){
            let matches = data.match(tagRegex);
            return matches[1];
        }
        else return data.toString().toLowerCase();
    }

    get data(){ return this.rowData; };
    
    get(){ return this.rowData; };

    toJSON(){ return this.get(); };

    static KeyFromHTML(tr: HTMLElement){
        let k = $(tr).first().data("data");
        let key = parseInt(k);
        if (key == NaN) return undefined;
        else return key;
    }
}