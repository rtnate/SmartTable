import $ from 'jquery';
import {TableData} from "./TableData";
import {TableParser} from "./TableParser";
import { TableColumn } from './TableColumn';
import * as XLSX from 'xlsx';

export class SmartTable
{
    private selectable = false;
    private sortable = false;
    private data = new TableData();

    constructor(private table: JQuery<HTMLElement>)
    {
        if (this.table.hasClass('sortable')) this.addSortingIcons();
        if (this.table.hasClass('clickable')){
            this.selectable = true;
            this.makeClickable();
        }
        let t = table.get(0) as HTMLTableElement;
        if (t) this.parseDataFromTable(t);
        $('#tableExportXls').click(
            (e) =>{
                e.preventDefault();
                this.exportToXLS();
            }
        );
    }


    private exportToXLS()
    {
        /* create a new blank workbook */
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.table_to_sheet(this.table.get(0), {raw: true});
        XLSX.utils.book_append_sheet(wb, ws, 'ExportData');
        let filename = prompt("Please nter a file name:");
        if (filename)
        {
            XLSX.writeFile(wb, `${filename}.xlsx`);
        }
    }

    private parseDataFromTable(table: HTMLTableElement)
    {
        let parser = new TableParser();
        parser.parseHTML(table);
        let data = parser.tableData.raw();
        this.data = parser.tableData;
    }

    private redrawBody(){
        let tbody = this.table.find('tbody').first();
        let html = this.data.toHTMLTableBody();
        tbody.html(this.data.toHTMLTableBody());
        this.makeClickable();
    }

    private redraw()
    {

    }

    private addSortingIcons(){
        let ths = this.table.find('th').not('.not-sortable');
        let self = this;
        let sortAscending = $(document.createElement('span')).addClass('sort-ascending');
        sortAscending.click( function(){
            self.onSortAscending(this);
        });
        let sortDescending = $(document.createElement('span')).addClass('sort-descending');
        sortDescending.click( function(){
            self.onSortDescending(this);
        });
        let sortIcons = $(document.createElement('div')).addClass('sort-icons').append(sortAscending).append(sortDescending);
        ths.append(sortIcons);
    }

    private makeClickable(){
        let tbody = this.table.find('tbody');
        let rows = tbody.find('tr');
        let target = this.table.data('target');
        if (target)
        rows.click(
            (e) => {
                rows.removeClass('active');
                let tr = $(e.currentTarget);
                let i = rows.index(e.currentTarget);
                tr.addClass('active');
                this.data.selectRow(i);
            }
        )
        rows.dblclick(
            (e) => {
                let selected = this.data.selected;
                let key = null;
                if (selected) key = selected.key;
                if (key != null && target)
                {
                    //IF LAST ITEM IS AN =
                    target = target.trim();
                    if (/(=$)/.test(target))
                    {
                        window.location.href = `${target}${key}`;
                    } else {
                        //REMOVE TRAILING SLASH
                        target = target.replace(/\/+$/, "");
                        window.location.href = `${target}/${key}`;
                    }
                }
            }
        )
    }

    private onSortAscending(targetElement: HTMLElement)
    {
        let icons = $(targetElement).parent();
        if (icons.hasClass('ascending'))
        {
            this.clearSorting();
            this.sortDefault();
        }
        else{
            this.clearSorting();
            icons.addClass('ascending');
            this.sortAscending(icons.parent());
        }
    }

    private onSortDescending(targetElement: HTMLElement)
    {
        let icons = $(targetElement).parent();
        if (icons.hasClass('descending'))
        {
            this.clearSorting();
            this.sortDefault();
        }
        else{
            this.clearSorting();
            icons.addClass('descending');
            this.sortDescending(icons.parent());
        }
    }

    /**
     * Remove sorting classes from all th elements
     */
    private clearSorting()
    {
        this.table.find('th .sort-icons').removeClass('ascending').removeClass('descending');
    }

    private sortAscending(column: JQuery<HTMLElement>){
        let columnName = TableColumn.GetNameFromElement(column);
        this.data.sortBy(columnName);
        this.redrawBody();
    }

    private sortDescending(column: JQuery<HTMLElement>){
        let columnName = TableColumn.GetNameFromElement(column);
        this.data.sortBy(columnName, true);
        this.redrawBody();
    }

    private sortDefault(){
        this.data.sortDefault();
        this.redrawBody();
    }

    printData(){
        console.log("Data: ", this.data.raw());
    }

    /**
     * Selects the first table with class '.smart-table' and returns a new smart
     * table attached to it.  Returns null if no tables are found
     */
    static First(): SmartTable | null {
        let table = $('table.smart-table');
        if (table.length == 0) return null;
        else return new SmartTable(table.first());
    }

    /**
     * Selects all tables in the document with class '.smart-table'
     * Returns an array of SmartTables, one for each table
     */
    static All()
    {
        let tables = $('table.smart-table');
        let smartTables = [] as Array<SmartTable>;
        tables.each( function(){
            let st = new SmartTable($(this));
            smartTables.push(st);
        });
        return smartTables;
    }
}
