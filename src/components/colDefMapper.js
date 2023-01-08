export const mapFullColDefToLean = (colDef) => {
  return {
    headerName: colDef.headerName,
    sortable: colDef.sortable,
    field: colDef.field,
  }
}

export const mapFullColGroupDefToLean = (colGroupDef) => {
  const leanDef = {
    headerName: colGroupDef.headerName,
    groupId: colGroupDef.groupId,
  }
  if (!colGroupDef.children) return leanDef
  leanDef.children = colGroupDef.children.map((c) => {
    if (c.children) return mapFullColGroupDefToLean(c)
    return mapFullColDefToLean(c)
  })

  return leanDef
}

export const mapHeaderSet = (colDefs) => {
  return colDefs.map((cd) => {
    if (cd.children) return mapFullColGroupDefToLean(cd)
    return mapFullColDefToLean(cd)
  })
}