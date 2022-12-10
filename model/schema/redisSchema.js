
import {Entity, Schema} from "redis-om"

class Task extends Entity{
}

export const taskSchema = new Schema(Task, {}, { dataStructure: 'JSON'})
