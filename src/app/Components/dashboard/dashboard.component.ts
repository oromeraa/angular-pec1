import { Component } from '@angular/core';
import { PostDTO } from 'src/app/Models/post.dto';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  posts!: PostDTO[];
  totalLikes: number;
  totalDislikes: number;

  constructor(
    private postService: PostService,
    private sharedService: SharedService,
  ) {
    this.totalLikes = 0;
    this.totalDislikes = 0;
    this.loadDashboard();
  }

  private async loadDashboard(): Promise<void> {
    let errorResponse: any;

    try {
      this.posts = await this.postService.getPosts();
      this.countLikesAndDislikes();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  private countLikesAndDislikes(): void {
    for (const post of this.posts) {
      if (post.num_likes) {
        this.totalLikes += post.num_likes;
      }
      if (post.num_dislikes) {
        this.totalDislikes += post.num_dislikes;
      }
    }
  }
}
