
// Since we don't have shared types set up perfectly between client/server yet in this mono-repo structure
// (or at least I want to avoid complex relative imports for now if tsconfig isn't set up for it),
// I will define the params here or use any.
// Ideally we should import from a shared types package.
// For now, I'll define a generic Shape interface or use implicit types.

export interface Shape {
  id: string;
  type: string;
  [key: string]: any;
}

interface RoomData {
  shapes: Shape[];
  historyIndex: number;
}

// In-memory store: roomId -> RoomData
const rooms: Record<string, RoomData> = {};

export const getRoomData = (roomId: string): RoomData => {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      shapes: [],
      historyIndex: 0,
    };
  }
  return rooms[roomId];
};

export const updateRoomData = (roomId: string, data: Partial<RoomData>) => {
  const room = getRoomData(roomId);
  rooms[roomId] = { ...room, ...data };
  return rooms[roomId];
};
