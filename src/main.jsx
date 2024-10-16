import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ServiceCommandUnit from "./ServiceCommandUnit";
import { static_items } from "./data";

// a little function to help with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: "100%",
});

const App = () => {
  const [items, setItems] = useState(static_items);

  // useEffect to log updated items
  useEffect(() => {
    console.log("Updated items array:", items);
  }, [items]);

  // Handle Drag and Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (result.type === "droppableItem") {
      const reorderedItems = reorder(items, sourceIndex, destIndex);
      setItems(reorderedItems);
    } else if (result.type === "droppableSubItem") {
      const itemSubItemMap = items.reduce((acc, item) => {
        acc[item.id] = item.subItems;
        return acc;
      }, {});

      const sourceParentId = result.source.droppableId;
      const destParentId = result.destination.droppableId;

      const sourceSubItems = itemSubItemMap[sourceParentId];
      const destSubItems = itemSubItemMap[destParentId];

      let newItems = [...items];

      if (sourceParentId === destParentId) {
        const reorderedSubItems = reorder(
          sourceSubItems,
          sourceIndex,
          destIndex
        );
        newItems = newItems.map((item) => {
          if (item.id === sourceParentId) {
            item.subItems = reorderedSubItems;
          }
          return item;
        });
      } else {
        let newSourceSubItems = [...sourceSubItems];
        const [draggedItem] = newSourceSubItems.splice(sourceIndex, 1);

        let newDestSubItems = [...destSubItems];
        newDestSubItems.splice(destIndex, 0, draggedItem);
        newItems = newItems.map((item) => {
          if (item.id === sourceParentId) {
            item.subItems = newSourceSubItems;
          } else if (item.id === destParentId) {
            item.subItems = newDestSubItems;
          }
          return item;
        });
      }
      setItems(newItems);
    }
  };

  // Button 1: Add new parent item
  const addParentItem = () => {
    const newItem = {
      id: `${Date.now()}-new`, // unique ID
      content: `New Parent Item`, // content for parent
      subItems: [], // empty subItems array initially
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  // Button 2: Add new sub-item to the first parent item (for simplicity)
  const addSubItem = (parentId) => {
    const newSubItem = {
      id: `${Date.now()}-sub`, // unique subItem ID
      content: `New SubItem`, // content for subItem
    };

    const updatedItems = items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          subItems: [...item.subItems, newSubItem], // add subItem to the correct parent
        };
      }
      return item;
    });

    setItems(updatedItems);
  };

  return (
    <>
      <button onClick={addParentItem}>Add Parent Item</button>
      <button onClick={() => addSubItem("1-asd")}>
        Add Sub Item to First Parent
      </button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" type="droppableItem">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        {item.content}
                        <span
                          {...provided.dragHandleProps}
                          style={{
                            display: "inline-block",
                            margin: "0 10px",
                            border: "1px solid #000",
                          }}
                        >
                          Drag
                        </span>
                        <ServiceCommandUnit
                          subItems={item.subItems}
                          type={item.id}
                        />
                      </div>
                      {provided.placeholder}
                    </>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

const root = createRoot(document.getElementById("root"));

// Render the App component into the DOM
root.render(<App />);
