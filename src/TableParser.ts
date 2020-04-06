import { TableData, TableRow, TableColumn } from "./TableData";
import $ from 'jquery';

class ParserRowData{
    constructor(public rows: JQuery<HTMLElement>, public length: number){}
}

export class TableParser
{
    private wellFormed = false;
    private data = new TableData();
    constructor(){};

    parseHTML(table: HTMLTableElement)
    {
        let thead = $(table).find('thead');
        if (thead.length > 0) this.parseHTMLWithTHead(table, thead);
        else this.parseHTMLWithNoTHead(table);
    }

    get tableData(){
        return this.data;
    }

    loadColumns(headerColumns: JQuery<HTMLElement>)
    {
        headerColumns.each(
            (i, el) => {
                let th = $(el);
                let dataName = th.data('column');
                let columnLabel = th.text();
                let name = TableColumn.GetNameFromElement(th);
                this.data.addColumn(name, columnLabel, i);
            }
        )
    }

    private parseHTMLWithTHead(table: HTMLTableElement, thead: JQuery<HTMLElement>)
    {   
        let tableHeader = thead.first();
        let headerColumns = tableHeader.find('th');
        this.loadColumns(headerColumns);
        let tbody = $(table).find('tbody');
        let rowData;
        if (tbody.length > 0) rowData = this.getHTMLTableRowsFromTbody(tbody);
        else rowData = this.getHTMLTableRowsPlain(table);
        this.parseRows(rowData);
    }

    private getHTMLTableRowsFromTbody(tbody: JQuery<HTMLElement>)
    {
        let rows = tbody.find('tr');
        return new ParserRowData(rows, rows.length);
    }

    private getHTMLTableRowsPlain(table: HTMLTableElement)
    {
        let rows = table.rows;
        let rowsFiltered = $();
        for (let row in rows)
        {
            let r = $(row);
            if (r.find('th').length == 0)
            {
                if (r.find('tr').length > 0)
                {
                    rowsFiltered.add(r);
                }
            }
        }
        return new ParserRowData(rowsFiltered, rowsFiltered.length);
    }

    private parseHTMLWithNoTHead(table: HTMLTableElement)
    {

    }

    private validatedTableFormation(rowData: ParserRowData, noHeaderColumns: number)
    {
        let wellFormed = true;
        rowData.rows.each(
            function(){
               let noColumns = $(this).find('td').length;
               if (noColumns != noHeaderColumns) wellFormed = false;
            }
        );
        return wellFormed;
    }

    private parseRows(rowData: ParserRowData)
    {
        let rows = rowData.rows;
        let wellFormed = true;
        rows.each(
            (i, el) => {
                let row = $(el);
                let tableRow = new TableRow();
                let rowKey = parseInt(row.data('row'))
                if (isNaN(rowKey)) tableRow.addKey(i);
                else tableRow.addKey(rowKey);
                let columns = row.find('td');
                if (columns.length != this.data.noColumns) wellFormed = false;
                columns.each(
                    (i, el) =>{
                        let column = $(el);
                        let colName = column.data('column');
                        let tableColumn = null;
                        if (colName)
                        {
                            tableColumn = this.data.getColumnByName(colName);
                        }
                        else tableColumn = this.data.column(i);
                        if (tableColumn) tableRow.addColumn(tableColumn, column.html());
                    }
                );
                this.data.addRow(tableRow, i);
            }
        )
        this.wellFormed = wellFormed;
    }

}