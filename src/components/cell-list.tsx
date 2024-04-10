import { useTypedSelector } from "../hooks/use-typed-selector";
import CellListItem from "./cell-list-item";
import AddCell from "./add-cell";
import { Fragment } from "react";

const CellList: React.FC = () => {
    const cells = useTypedSelector(({ cells: { order, data } }) => {
        return order.map((id) => {
            return data[id];
        });
    });

    const renderedCells = cells.map(cell => (
        <Fragment key={cell.id}>
            <AddCell nextCellId={cell.id} />
            <CellListItem key={cell.id} cell={cell} />
        </Fragment>
    ));

    return <div>
        {renderedCells}
        <AddCell forceVisible={cells.length === 0} nextCellId={null} />
    </div>
}

export default CellList;