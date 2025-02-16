import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from '../../list/list.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentType } from '../../list/dto/create-list-item.dto';

describe('ListService', () => {
  let listService: ListService;
  let mockUserModel: any;

  const mockUser = {
    username: 'testuser',
    myList: [],
    save: jest.fn().mockImplementation(function () {
      return this;
    }),
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    listService = module.get<ListService>(ListService);
  });

  describe('addToList', () => {
    it('should add item to user list', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const listItem = {
        contentId: 'movie123',
        contentType: ContentType.MOVIE,
      };

      const result = await listService.addToList('testuser', listItem);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(result.myList).toContainEqual(listItem);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const listItem = {
        contentId: 'movie123',
        contentType: ContentType.MOVIE,
      };

      await expect(listService.addToList('testuser', listItem)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException for duplicate item', async () => {
      const userWithDuplicate = {
        ...mockUser,
        myList: [
          {
            contentId: 'movie123',
            contentType: ContentType.MOVIE,
          },
        ],
      };
      mockUserModel.findOne.mockResolvedValue(userWithDuplicate);

      const listItem = {
        contentId: 'movie123',
        contentType: ContentType.MOVIE,
      };

      await expect(listService.addToList('testuser', listItem)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('listMyItems', () => {
    it('should return paginated list items', async () => {
      const mockUserWithItems = {
        ...mockUser,
        myList: [
          { contentId: 'movie1', contentType: ContentType.MOVIE },
          { contentId: 'movie2', contentType: ContentType.MOVIE },
          { contentId: 'movie3', contentType: ContentType.MOVIE },
        ],
      };
      mockUserModel.findOne.mockResolvedValue(mockUserWithItems);

      const result = await listService.listMyItems('testuser', {
        limit: 2,
        offset: 1,
      });

      expect(result.total).toBe(3);
      expect(result.items.length).toBe(2);
      expect(result.items[0].contentId).toBe('movie2');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(listService.listMyItems('testuser', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeFromList', () => {
    it('should remove item from user list', async () => {
      const mockUserWithItems = {
        ...mockUser,
        myList: [
          { contentId: 'movie123', contentType: ContentType.MOVIE },
          { contentId: 'movie456', contentType: ContentType.MOVIE },
        ],
        save: jest.fn().mockImplementation(function () {
          return this;
        }),
      };
      mockUserModel.findOne.mockResolvedValue(mockUserWithItems);

      const result = await listService.removeFromList('testuser', {
        contentId: 'movie123',
        contentType: ContentType.MOVIE,
      });

      expect(result.myList.length).toBe(1);
      expect(result.myList[0].contentId).toBe('movie456');
    });

    it('should throw NotFoundException if item not in list', async () => {
      const mockUserWithItems = {
        ...mockUser,
        myList: [{ contentId: 'movie456', contentType: ContentType.MOVIE }],
      };
      mockUserModel.findOne.mockResolvedValue(mockUserWithItems);

      await expect(
        listService.removeFromList('testuser', {
          contentId: 'movie123',
          contentType: ContentType.MOVIE,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
