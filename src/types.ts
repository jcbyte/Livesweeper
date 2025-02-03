export interface ICell
{
  revealed : boolean;
  flagged : boolean;
  value : "bomb" | number;
}

export interface IGame
{
  board :ICell[][]
}