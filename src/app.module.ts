import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecipeIngredientsModule } from './recipe-ingredients/recipe-ingredients.module';
import { RecipeStepsModule } from './recipe-steps/recipe-steps.module';
import { TagsModule } from './tags/tags.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokensService } from './refresh-tokens/refresh-tokens.service';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { ReviewModule } from './review/review.module';
import { FavouriteModule } from './favourites/favourites.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { env } from 'prisma/config';
import { EmailChangeRequestsModule } from './email-change-requests/email-change-requests.module';
import { SearchService } from './search/search.service';
import { EmbeddingService } from './embedding/embedding.service';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    RecipesModule,
    RecipeIngredientsModule,
    RecipeStepsModule,
    TagsModule,
    RefreshTokensModule,
    ReviewModule,
    FavouriteModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: env('EMAIL_USER'),
          pass: env('EMAIL_APP_PASSWORD'),
        },
      },
      defaults: {
        from: '"No Reply" <aungkaungmyat912002@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), 'dist', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    EmailChangeRequestsModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RefreshTokensService,
    SearchService,
    EmbeddingService,
  ],
})
export class AppModule {}
