import { PrismaClient, Prisma } from "@prisma/client";
import * as people from './people';
import * as groups from './groups';
import { match } from "assert";
import { encryptMatch } from "../util/match";

const prisma = new PrismaClient();

export const getAll = async () => {
    try {
        return await prisma.event.findMany();
    } catch(err) {
        return false;
    }
}
export const getOne = async (id: number) => {
    try {
        return await prisma.event.findFirst({ where: { id } });
    } catch (err) { return false }
}

type eventsCreateData = Prisma.Args<typeof prisma.event, 'create'>['data'];
export const add = async (data: eventsCreateData) => {
    try {
        return await prisma.event.create({ data });
    } catch (err) { return false}
}

type EventsUpdateData = Prisma.Args<typeof prisma.event, 'update'>['data'];

export const update = async (id: number, data: EventsUpdateData) => {

    try {
      return await prisma.event.update({ where: { id }, data }); 
    } catch (err){ return false }
}

export const remove = async (id: number) => {
    try {
        return await prisma.event.delete({ where: { id } })
    } catch(err) { return false }
}

/*
GRUPO A (id: 2)
-- Boniey
-- Márcio
-- Pedro

GRUPO B (id: 3)
-- João
-- Inacio
-- Gabriela

GRUPO C (id: 4)
-- Gabriela

*/
export const doMaMatches = async (id: number ): Promise<boolean> => {
    
    const eventItem = await prisma.event.findFirst({ where: { id }, select: { grouped: true } });
    if(eventItem){
        const peopleList = await people.getAll({ id_event: id });
        if(peopleList) {
            let sortedList: { id: number, match: number }[] = [];
            let sorteble: number[] = [];

            let attemps = 0;
            let maxAttempts = peopleList.length;
            let keepTrying = true;
            while(keepTrying && attemps < maxAttempts) {
                keepTrying = false;
                attemps++;
                sortedList = [];
                sorteble = peopleList.map(item => item.id)

                for(let i in peopleList){
                    let sortableFiltered: number[] = sorteble;
                    if(eventItem.grouped){
                        sortableFiltered = sorteble.filter(sortableItem => {
                            let sortablePerson = peopleList.find(item => item.id === sortableItem);
                            return peopleList[i].id_group !== sortablePerson?.id_group;
                        });
                    }

                    if(sortableFiltered.length === 0 || (sortableFiltered.length === 1 && peopleList[i].id === sortableFiltered[0] )) {
                        keepTrying = true;
                    } else {
                        let sortedIndex = Math.floor(Math.random() * sortableFiltered.length );
                        while(sortableFiltered[sortedIndex] === peopleList[i].id) {
                            sortedIndex  = Math.floor(Math.random() * sortableFiltered.length);
                        }

                        sortedList.push({
                            id: peopleList[i].id,
                            match: sortableFiltered[sortedIndex]
                        });

                        sorteble = sorteble.filter(item => item !== sortableFiltered[sortedIndex])
                    }
                }
            }

            
            //console.log(`ATTEMPS: ${attemps}`);
            //console.log(`MAX ATTEMPS: ${maxAttempts}`);
            //console.log(sortedList);
            
            if(attemps < maxAttempts) {
                for(let i in sortedList) {
                    await people.update({
                        id: sortedList[i].id,
                        id_event: id
                    }, { matched: encryptMatch(sortedList[i].match) });  // TODO: Criar encryptMatch
                }
                return true;
            } 
        }
    }
    return false; // TEMP
}