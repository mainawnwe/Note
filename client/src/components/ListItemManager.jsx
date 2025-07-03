import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

export default function ListItemManager({ items, onChange, darkMode }) {
  const addItem = () => {
    onChange([...items, { id: Date.now(), text: '', checked: false }]);
  };

  const updateItem = (id, text) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const toggleChecked = (id) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    
    onChange(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="listItems">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="space-y-2 py-2"
          >
            {items.map((item, index) => (
              <Draggable 
                key={item.id} 
                draggableId={item.id.toString()} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex items-start rounded-lg p-1 ${
                      snapshot.isDragging 
                        ? darkMode 
                          ? 'bg-gray-700' 
                          : 'bg-blue-100'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleChecked(item.id)}
                      className={`
                        mt-1.5 mr-2 w-5 h-5 rounded-full border-2
                        ${item.checked
                          ? 'bg-green-500 border-green-500'
                          : darkMode
                            ? 'border-gray-400 bg-gray-700'
                            : 'border-gray-400 bg-white'
                        }
                      `}
                    />
                    
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      placeholder="List item"
                      className={`
                        flex-grow p-2 rounded-lg
                        ${item.checked ? 'line-through text-gray-500' : ''}
                        ${darkMode 
                          ? 'bg-gray-800/50 text-white' 
                          : 'bg-white/50 text-gray-800'
                        }
                      `}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            <button
              type="button"
              onClick={addItem}
              className={`
                mt-2 px-4 py-2 rounded-lg flex items-center
                ${darkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              <Plus className="mr-2 h-5 w-5" />
              <span>Add item</span>
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
