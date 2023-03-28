const ChartDetail: React.FC<any> = ({
    data
}) => {
    const {
        info,
        duration,
        start,
    } = data || {}
    const {
        column, line, name, resourceURI
    } = info || {}

    return <div>
        {data && <div>
            <div>column: {column}</div>
            <div>line: {line}</div>
            <div>resourceURI: {resourceURI}</div>
            <div>name: {name}</div>
            <div>duration: {duration}</div>
            <div>start: {start}</div>
        </div>}
    </div>
}

export default ChartDetail